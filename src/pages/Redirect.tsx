import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { AppDispatch } from "store";
import { singleSignOnAction } from "store/ducks/singleSignOnUserAccount";

export function SigninOidc() {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(singleSignOnAction()).finally(() => {
      navigate("/");
    });
  }, [dispatch, navigate]);

  return <div>Redirecting...</div>;
}
