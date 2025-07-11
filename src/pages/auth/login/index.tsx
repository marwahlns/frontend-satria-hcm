import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Cookies from "js-cookie";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const schema = yup.object().shape({
  email: yup.string().email("Invalid email address").required("Email is required"),
  password: yup.string().required("Password is required"),
});

export default function Login() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          email: data.email,
          password: data.password,
        }
      );

      const { access_token: token, user } = response.data.data;

      Cookies.set("token", token, { expires: 1 });
      Cookies.set("role", user.role_id, { expires: 1 });
      Cookies.set("user_name", user.name, { expires: 1 });
      Cookies.set("user_department", user.department, { expires: 1 });
      Cookies.set("user_division", user.division, { expires: 1 });
      Cookies.set("dept_head", user.dept_head, { expires: 1 });
      Cookies.set("nrp", user.personal_number, { expires: 1 });
      Cookies.set("is_dept_head", user.is_dept_head ? "true" : "false", {
        expires: 1,
      });

      const role = Cookies.get("role");
      const nrp = Cookies.get("nrp");
      if (role === "10") {
        router.push("/dashboard/dashboardEmployee");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error(err);
      setError("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center grow bg-center bg-no-repeat page-bg bg-[url('/media/images/2600x1200/bg-10.png')]">
      <div className="card max-w-[370px] w-full">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="card-body flex flex-col gap-5 p-10"
        >
          <div className="text-center mb-2.5">
            <img
              src="/media/app/default-logo.png"
              alt="Logo"
              className="mx-auto w-20 h-auto"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="form-label font-normal text-gray-900">
              Email
            </label>
            <input
              {...register("email")}
              className={`input ${errors.email ? "border-red-500" : ""}`}
              type="text"
              placeholder="Email"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="form-label font-normal text-gray-900">
              Password
            </label>
            <input
              {...register("password")}
              className={`input ${errors.password ? "border-red-500" : ""}`}
              type="password"
              placeholder="Enter Password"
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary flex justify-center grow"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 mr-3 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Loading...
              </>
            ) : (
              "Login"
            )}
          </button>
          {error && <p className="text-red-500 text-center mt-2">{error}</p>}
        </form>
      </div>
    </div>
  );
}
