
import setuptools

setuptools.setup(
    name="jupyterlab_sql",
    version="0.1.0",
    packages=setuptools.find_packages(),
    setup_requires=['setuptools_scm'],
    use_scm_version={"version_scheme": "post-release"},
    install_requires=[
        "jupyterlab",
        "sqlalchemy"
    ]
)
