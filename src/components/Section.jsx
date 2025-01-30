import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

const Section = ({ title, isOpen, toggleOpen, children }) => (
  <div className="space-y-4">
    <button
      type="button"
      onClick={toggleOpen}
      className="flex items-center space-x-2 text-sm"
    >
      <h3 className="text-lg font-medium">{title}</h3>
      <span className="text-sm">{isOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}</span>
    </button>
    {isOpen && <div className="space-y-4">{children}</div>}
  </div>
);

export default Section;