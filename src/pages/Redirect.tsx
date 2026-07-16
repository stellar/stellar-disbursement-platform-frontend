import { useEffect } from "react";

import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { singleSignOnAction } from "@/store/ducks/singleSignOnUserAccount";

import { AppDispatch } from "@/store";


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
