
import os
import sys
import setuptools
from subprocess import check_call

from pathlib import Path

from distutils import log
log.set_verbosity(log.DEBUG)


HERE = Path(".")
NODE_ROOT = HERE
NPM_PATH = [
    NODE_ROOT / "node_modules" / ".bin",
    os.environ.get("PATH", os.defpath)
]

CLIENT_VERSION = "0.1.1-rc2"


def update_package_data(distribution):
    """update package_data to catch changes during setup"""
    build_py = distribution.get_command_obj('build_py')
    build_py.finalize_options()


class NPM(setuptools.Command):
    description = "Install package.json dependencies using NPM"
    user_options = []
    node_modules = NODE_ROOT / "node_modules"
    targets = [
        HERE / "labextension" / "jupyterlab-sql-{}.tgz".format(CLIENT_VERSION)
    ]

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
        env['PATH'] = NPM_PATH

        if self.should_run_npm_install():
            log.info("Installing build dependencies with npm.")
            check_call(
                ["npm", "install"],
                cwd=NODE_ROOT, stdout=sys.stdout, stderr=sys.stderr
            )
            os.utime(self.node_modules, None)

        log.info("Building jupyterlab-sql.")
        check_call(
            ["npm", "run", "build:dist"],
            cwd=NODE_ROOT, stdout=sys.stdout, stderr=sys.stderr
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


setuptools.setup(
    name="jupyterlab_sql",
    version="0.1.0",
    packages=setuptools.find_packages(),
    setup_requires=['setuptools_scm'],
    use_scm_version={"version_scheme": "post-release"},
    install_requires=[
        "jupyterlab",
        "sqlalchemy"
    ],
    cmdclass={
        "jsdeps": NPM
    }
)
