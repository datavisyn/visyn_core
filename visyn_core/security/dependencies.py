from fastapi import HTTPException, Request, status

from .. import manager
from .model import User


def get_current_user(request: Request) -> User:
    """FastAPI dependency for the user. Ensures the user is logged in.
    Usage:
    ```
    ...
    def route(user: User = Depends(get_current_user)):
        ...
    ```
    """
    # Iterate through list of user providers
    user = manager.security.current_user

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user
