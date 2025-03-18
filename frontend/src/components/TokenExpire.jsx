import React from "react";

const TokenExpire = ({ title, message, onConfirm }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-xl shadow-lg text-center">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <p className="mb-6">{message}</p>
        <button
          onClick={onConfirm}
          className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default TokenExpire;
