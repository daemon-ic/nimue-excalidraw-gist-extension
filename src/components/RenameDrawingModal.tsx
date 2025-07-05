import Modal from "./Modal"
import Button from "./Button"
import Input from "./Input"
import { useState } from "react";

interface RenameDrawingModalProps {
    onClose: () => void;
    onSubmit: (newName: string) => void;
    currentName: string;
}

export default function RenameDrawingModal({ 
    onClose, 
    onSubmit, 
    currentName 
}: RenameDrawingModalProps) {
    const [name, setName] = useState(currentName);

    function handleSubmit() {
        if (!name.trim() || name.trim() === currentName) {
            return;
        }
        onSubmit(name.trim());
        onClose();
    }

    function handleKeyPress(e: React.KeyboardEvent) {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    }

    const hasChanged = name.trim() !== currentName;

    return (
        <Modal title="Rename Drawing" handleOnClose={onClose}>
            <div className="flex flex-col gap-6 w-full">
                <p className="text-sm text-gray-600">Update the name of your drawing</p>
                <div className="py-2">
                    <Input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter new name..."
                        autoFocus
                    />
                </div>

                <div className="flex gap-3 pt-2">
                    <Button
                        onClick={!name.trim() || !hasChanged ? () => {} : handleSubmit}
                        className={!name.trim() || !hasChanged ? "opacity-50 cursor-not-allowed" : ""}
                    >
                        Rename
                    </Button>
                    <Button onClick={onClose} variant="secondary">
                        Cancel
                    </Button>
                </div>
            </div>
        </Modal>
    )
} 