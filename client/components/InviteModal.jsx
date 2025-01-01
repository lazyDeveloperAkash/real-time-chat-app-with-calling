import React, { useState } from 'react';
import { FaWhatsapp, FaTelegramPlane, } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';

const InviteModal = ({ setInvite }) => {

  console.log(process.env.NEXT_PUBLIC_INVITE_LINK)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(process.env.NEXT_PUBLIC_INVITE_LINK);
    alert('Invite link copied to clipboard!');
  };

  return (
    <div onClick={(e)=> e.target.id === "invite-container" && setInvite(false)} id='invite-container' className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg relative">
        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
          onClick={()=> setInvite(false)}
        >
          <IoMdClose color='black' size={25} />
        </button>

        {/* Modal Header */}
        <h2 className="text-lg font-semibold mb-4 text-center">Invite Friends</h2>

        {/* Invite Link */}
        <div className="mb-4">
          <label htmlFor="inviteLink" className="block text-sm font-medium text-gray-700">
            Invite Link
          </label>
          <div className="flex items-center mt-2">
            <input
              id="inviteLink"
              type="text"
              readOnly
              value={process.env.NEXT_PUBLIC_INVITE_LINK}
              className="w-full border border-gray-300 rounded-l-lg py-2 px-3 text-gray-600 focus:ring-2 focus:ring-[#4acd8d] focus:outline-none"
            />
            <button
              className="bg-[#4acd8d] text-white px-4 py-2 rounded-r-lg hover:bg-[#49df97]"
              onClick={copyToClipboard}
            >
              Copy
            </button>
          </div>
        </div>

        {/* Share Apps */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Share via:</p>
          <div className="flex gap-4 justify-center">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(process.env.NEXT_PUBLIC_INVITE_LINK)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-500 hover:text-green-600"
            >
              <FaWhatsapp size={24} />
            </a>
            <a
              href={`https://t.me/share/url?url=${encodeURIComponent(process.env.NEXT_PUBLIC_INVITE_LINK)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-500"
            >
              <FaTelegramPlane size={24} />
            </a>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default InviteModal;

// Example usage of the InviteModal
// const App = () => {
//   const [isModalOpen, setModalOpen] = useState(false);

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <button
//         className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
//         onClick={() => setModalOpen(true)}
//       >
//         Open Invite Modal
//       </button>
//       <InviteModal
//         setInvite={isModalOpen}
//         onClose={() => setModalOpen(false)}
//         inviteLink="https://yourapp.com/invite?ref=12345"
//       />
//     </div>
//   );
// };

// export default App;
