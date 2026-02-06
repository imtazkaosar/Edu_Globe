import React, { useState } from "react";
import ROLE from "../common/role";
import { FaWindowClose } from "react-icons/fa";
import SummaryApi from "../common";
import { toast } from "react-toastify";

const ChangeUserRole = ({ name, email, role, _id, onClose, callFunc }) => {
  const [userRole, setUserRole] = useState(role);
  const [userNewName, setUserNewName] = useState(name);
  const [userNewEmail, setUserNewEmail] = useState(email);

  const handleOnChangeSelect = (e) => {
    setUserRole(e.target.value);

    console.log(e.target.value);
  };
  const handleOnChangeName = (e) => {
    setUserNewName(e.target.value);

    console.log(e.target.value);
  };
  const handleOnChangeEmail = (e) => {
    setUserNewEmail(e.target.value);

    console.log(e.target.value);
  };

  const updateUserRole = async () => {
    console.log(_id,userRole,userNewEmail,userNewName)
    const fetchResponse = await fetch(SummaryApi.updateUser.url, {
      method: SummaryApi.updateUser.method,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: _id,
        role: userRole,
        name: userNewName,
        email: userNewEmail,
      }),
    });
    const responseData = await fetchResponse.json();

    if (responseData.success) {
      toast.success(responseData.message);
      onClose();
      callFunc();
    }
    console.log("role updated", responseData);
  };

  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 w-full z-10 flex justify-center items-center bg-slate-200 bg-opacity-50">
      <div className="relative bg-white shadow-lg p-6 w-full max-w-lg rounded-lg">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <FaWindowClose size={24} />
        </button>
        <h1 className="pb-4 text-2xl font-semibold text-center text-gray-800">
          Change User Details
        </h1>
        <div className="text-gray-700 w-full">
          <p className="p-2 text-lg">
            <span className="font-medium">Current Name:</span> {name}
          </p>
          <input
            type="text"
            placeholder="Enter new name"
            name="newName"
            value={userNewName}
            onChange={handleOnChangeName}
            className="w-full p-2 border border-gray-300 rounded-lg bg-white mb-4"
          />
          <p className="p-2 text-lg">
            <span className="font-medium">Current Email:</span> {email}
          </p>
          <input
            type="email"
            placeholder="Enter new email"
            name="newEmail"
            value={userNewEmail}
            onChange={handleOnChangeEmail}
            className="w-full p-2 border border-gray-300 rounded-lg bg-white mb-4"
          />
          <div className="flex items-center justify-between my-4">
            <p className="text-lg">
              <span className="font-medium">Role:</span>
            </p>
            <select
              className="border px-4 py-2 rounded-lg"
              value={userRole}
              onChange={handleOnChangeSelect}
            >
              {Object.values(ROLE).map((el) => (
                <option value={el} key={el}>
                  {el}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-center mt-4">
          <button
            className="bg-green-400 text-black px-4 py-2 rounded-full shadow hover:bg-green-700 hover:text-white transition duration-300"
            onClick={updateUserRole}
          >
            Change
          </button>
          <button
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-full shadow ml-4 hover:bg-gray-400 transition duration-300"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangeUserRole;
