"use client";
const PopupNotification = ({
  ref,
  text,
}: {
  ref: React.RefObject<HTMLDivElement>;
  text: string;
}) => {
  return (
    <div
      ref={ref}
      className="fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-500 opacity-0 translate-y-10 z-30 bg-opacity-50"
    >
      {text}
    </div>
  );
};

export default PopupNotification;
