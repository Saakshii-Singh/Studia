import { useState } from "react";
import API from "../services/api";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await API.post(
        "/auth/register",
        formData
      );

      console.log(
        "Registration successful:",
        response.data
      );

      alert("Registration successful!");
    } catch (error) {
      console.error(
        "Registration failed:",
        error.response?.data || error.message
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <form
        onSubmit={handleSubmit}
        className="bg-zinc-900 p-8 rounded-xl w-[350px] flex flex-col gap-4"
      >
        <h1 className="text-2xl font-bold text-white text-center">
          Register
        </h1>

        <input
          type="text"
          name="username"
          placeholder="Username"
          className="p-3 rounded bg-zinc-800 text-white outline-none"
          onChange={handleChange}
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          className="p-3 rounded bg-zinc-800 text-white outline-none"
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          className="p-3 rounded bg-zinc-800 text-white outline-none"
          onChange={handleChange}
        />

        <button className="bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition-colors">
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;
