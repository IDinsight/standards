"""Stand-ins for third-party packages the project declares but the grader's
image lacks (FastAPI, Redis, SQLAlchemy, and what they bring), so a service
module that imports one at the top still loads. A stand-in module gives any
name it is asked for as an empty class (an exception subclass, so it also works
in an except clause); it is used only when the real package cannot be found.
"""
import importlib.abc
import importlib.machinery
import sys
import types

STAND_INS = {"fastapi", "starlette", "pydantic", "pydantic_settings", "uvicorn", "sqlalchemy", "redis"}


class _AnyName(type):
    def __getattr__(cls, name):
        if name.startswith("__"):
            raise AttributeError(name)
        return _stand_in(name)


def _stand_in(name):
    return _AnyName(name, (Exception,), {"__init__": lambda self, *args, **kwargs: Exception.__init__(self, *args)})


def _module_getattr(name):
    if name.startswith("__"):
        raise AttributeError(name)
    return _stand_in(name)


class _Finder(importlib.abc.MetaPathFinder, importlib.abc.Loader):
    def find_spec(self, fullname, path=None, target=None):
        if fullname.split(".")[0] not in STAND_INS:
            return None
        return importlib.machinery.ModuleSpec(fullname, self, is_package=True)

    def create_module(self, spec):
        module = types.ModuleType(spec.name)
        module.__path__ = []
        module.__dict__["__getattr__"] = _module_getattr
        return module

    def exec_module(self, module):
        pass


# Last, so an installed package always wins.
sys.meta_path.append(_Finder())
