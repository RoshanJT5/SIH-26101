from fastapi import Depends, HTTPException, Header, Query, status
from sqlalchemy.orm import Session
from typing import Optional
from app.db.database import get_db
from app.models.user import User
from app.core.config import settings

def get_current_user_optional(
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None),
    user_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Extracts authenticated user from Authorization header, X-User-Id header, or user_id query param.
    """
    uid = None
    if authorization and "bearer-session-" in authorization.lower():
        try:
            parts = authorization.split("bearer-session-")
            if len(parts) > 1:
                uid = int(parts[1].strip())
        except Exception:
            pass
    elif authorization and authorization.lower().startswith("bearer "):
        token = authorization[7:].strip()
        if token.isdigit():
            uid = int(token)

    if uid is None and x_user_id and x_user_id.isdigit():
        uid = int(x_user_id)

    if uid is None and user_id is not None:
        uid = user_id

    if uid is not None:
        return db.query(User).filter(User.id == uid).first()

    return None

def require_admin_user(
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None),
    user_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
) -> User:
    """
    Guarantees the requesting user has administrative privileges.
    Checks user role / designation / demo admin flag.
    Blocks normal learners with HTTP 403 Forbidden.
    """
    user = get_current_user_optional(authorization, x_user_id, user_id, db)
    
    # If no user was provided, fallback to checking if prototype demo admin is accessed
    if not user:
        # In strict production without credentials, reject
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required to access admin intelligence."
        )

    role_name = user.role.role_name.lower() if user.role else ""
    designation = (user.designation or "").lower()
    job_role = (user.job_role or "").lower()
    email = user.email.lower()

    is_admin = (
        role_name == "admin"
        or designation == "admin"
        or job_role == "admin"
        or email == "admin@pragatiparikshan.demo"
    )

    if not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Official Administrator privileges required."
        )

    return user

