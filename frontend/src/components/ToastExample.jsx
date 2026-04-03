import React from 'react';
import { toast } from 'react-toastify';

const ToastExample = () => {
  const notifySuccess = () => {
    toast.success('This is a success toast!', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined
    });
  };

  return (
    <div className="p-4">
      <button
        onClick={notifySuccess}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Show Success Toast
      </button>
    </div>
  );
};

export default ToastExample;
