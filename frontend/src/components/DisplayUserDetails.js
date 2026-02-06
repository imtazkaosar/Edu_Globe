import React, { useState } from 'react'
import { FaWindowClose } from "react-icons/fa";
import { FaUserLarge } from "react-icons/fa6";


const DisplayUserDetails = ({
    name,
    email,
    role,
    onClose,
    profilePic,
}) => {
    const [imgError, setImgError] = useState(false);
   



  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 w-full z-10 flex justify-center items-center bg-slate-200 bg-opacity-50">
      <div className="relative bg-white shadow-lg p-6 w-full max-w-lg rounded-lg">
        <button className="absolute top-3 right-3 text-gray-500 hover:text-gray-700" onClick={onClose}>
          <FaWindowClose size={24} />
        </button>
        <h1 className="pb-4 text-2xl font-semibold text-center text-gray-800">User Details</h1>
        <div className="flex flex-col items-center">
        {imgError ? (
            <FaUserLarge className="w-24 h-24 text-gray-500 rounded-full shadow-md mt-4" />
          ) : (
            <img
              src={profilePic}
              alt="Profile"
              className="w-24 h-24 rounded-full shadow-md mt-4"
              onError={() => setImgError(true)}
            />
          )}
          <div className="text-gray-700 w-full text-center">
            <p className="p-2 text-lg"><span className="font-medium">Name:</span> {name}</p>
            <p className="p-2 text-lg"><span className="font-medium">Email:</span> {email}</p>
            <p className="p-2 text-lg"><span className="font-medium">Role:</span> {role}</p>
          </div>
        
          <div className="flex justify-center mt-4 w-full">
            
           
          </div>
        </div>
      </div>
    </div>
  )
}

export default DisplayUserDetails