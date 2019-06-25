import os
import sys
import setuptools
from setuptools.command.sdist import sdist
from setuptools.command.build_py import build_py
from setuptools.command.egg_info import egg_info
from subprocess import check_call

from pathlib import Path

from distutils import log

log.set_verbosity(log.DEBUG)


HERE = Path(".")
NODE_ROOT = HERE
NPM_PATH = [
    NODE_ROOT / "node_modules" / ".bin",
    os.environ.get("PATH", os.defpath),
]

IS_REPO = (HERE / ".git").exists()
PYVERSION_PATH = HERE / "jupyterlab_sql" / "version.py"

VERSION_TEMPLATE = """# This file is generated programatically.
# Version of the Python package
__version__ = "{}"
"""


def get_version():
    version_ns = {}
    with PYVERSION_PATH.open() as f:
        exec(f.read(), {}, version_ns)

    return version_ns["__version__"]


VERSION = get_version()
JS_EXTENSION = HERE / "labextension" / "jupyterlab-sql-{}.tgz".format(VERSION)


def update_package_data(distribution):
    """update package_data to catch changes during setup"""
    build_py = distribution.get_command_obj("build_py")
    build_py.finalize_options()


class BuildJsExtension(setuptools.Command):
    description = "Build application with npm"
    user_options = []
    node_modules = NODE_ROOT / "node_modules"
    targets = [JS_EXTENSION]

    def initialize_options(self):
        pass

    def finalize_options(self):
        pass

    def _has_npm(self):
        try:
            check_call(["npm", "--version"])
            return True
        except Exception:
            return False

    def should_run_npm_install(self):
        return not self.node_modules.exists()

    def run(self):
        has_npm = self._has_npm()
        if not has_npm:
            log.error(
                "`npm` unavailable.  If you're running this command "
                "using sudo, make sure `npm` is available to sudo"
            )
        env = os.environ.copy()
        env["PATH"] = NPM_PATH

        if self.should_run_npm_install():
            log.info("Installing build dependencies with npm.")
            check_call(
                ["npm", "install"],
                cwd=str(NODE_ROOT),
                stdout=sys.stdout,
                stderr=sys.stderr,
            )
            os.utime(str(self.node_modules), None)

        log.info("Building jupyterlab-sql.")
        check_call(
            ["npm", "run", "build:dist"],
            cwd=str(NODE_ROOT),
            stdout=sys.stdout,
            stderr=sys.stderr,
        )

        for t in self.targets:
            if not t.exists():
                msg = "Missing file: {}".format(t)
                if not has_npm:
                    msg += (
                        "\nnpm is required to build a development "
                        "version of jupyterlab-sql"
                    )
                raise ValueError(msg)

        update_package_data(self.distribution)


class SetVersion(setuptools.Command):
    description = "Set the version for both JS extension and server extension"
    user_options = [("version=", "v", "version")]

    def initialize_options(self):
        self.version = None

    def finalize_options(self):
        if self.version is None:
            raise ValueError("Parameter --version is missing")
        self.version = self._normalize_version(self.version)

    def _normalize_version(self, version):
        import semver

        version_info = semver.parse_version_info(version)
        version_string = str(version_info)
        return version_string

    def _set_pyversion(self):
        PYVERSION_PATH.write_text(VERSION_TEMPLATE.format(self.version))

    def _set_jsversion(self):
        package_json = NODE_ROOT / "package.json"
        with package_json.open() as f:
            lines = f.readlines()
        for iline, line in enumerate(lines):
            if '"version"' in line:
                lines[iline] = '  "version": "{}",\n'.format(self.version)
        with package_json.open("w") as f:
            f.writelines(lines)

    def run(self):
        log.info("Using normalized version {}.".format(self.version))
        self._set_pyversion()
        self._set_jsversion()


def build_js_extension(command):
    """decorator for building JS extension prior to another command"""

    class DecoratedCommand(command):
        def run(self):
            jsextension_command = self.distribution.get_command_obj(
                "jsextension"
            )
            all_targets_exist = all(
                t.exists() for t in jsextension_command.targets
            )
            if not IS_REPO and all_targets_exist:
                log.info("Skipping rebuilding JavaScript extension.")
                command.run(self)
                return

            try:
                self.distribution.run_command("jsextension")
            except Exception as e:
                log.error("Failed to build JavaScript extension")
                raise e
            command.run(self)
            update_package_data(self.distribution)

    return DecoratedCommand


setuptools.setup(
    name="jupyterlab_sql",
    version=VERSION,
    packages=setuptools.find_packages(),
    install_requires=["jupyterlab", "sqlalchemy", "jsonschema>=3"],
    cmdclass={
        "jsextension": BuildJsExtension,
        "build_py": build_js_extension(build_py),
        "egg_info": build_js_extension(egg_info),
        "sdist": build_js_extension(sdist),
        "set_version": SetVersion,
    },
    data_files=[("share/jupyter/lab/extensions", [str(JS_EXTENSION)])],
    package_data={"jupyterlab_sql": ["schemas/*.json"]},
    python_requires=">=3.5",
)
