import { PropsWithChildren } from "react";
import Button from "./Button";

type ModalProps = {
    title: string;
    handleOnClose: () => void;
    className?: string;
}

export default function Modal({ children, title, handleOnClose, className = "" }: PropsWithChildren<ModalProps>) {
    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            handleOnClose();
        }
    };

    return (
        <div 
            className="fixed top-0 left-0 w-full h-full z-[999] flex items-center justify-center bg-gray-900/80"
            onClick={handleOverlayClick}
        >
            <div className={`z-10 bg-white p-6 rounded-lg shadow-xl w-[90vw] max-h-[80vh] overflow-y-auto ${className}`}>
                <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
                {children}
            </div>
        </div>
    );
}