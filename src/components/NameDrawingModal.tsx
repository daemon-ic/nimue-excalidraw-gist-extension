import Modal from "./Modal"
import Button from "./Button"
import Input from "./Input"
import { useState } from "react";

interface NameDrawingModalProps {
    onClose: () => void;
    onSubmit: (name: string) => Promise<void>;
    title: string;
    placeholder?: string;
    initialValue?: string;
}

export default function NameDrawingModal({ 
    onClose, 
    onSubmit, 
    title, 
    placeholder = "Enter drawing name...",
    initialValue = ""
}: NameDrawingModalProps) {
    const [name, setName] = useState(initialValue);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit() {
        if (!name.trim()) {
            return;
        }
        setIsSubmitting(true);
        try {
            await onSubmit(name.trim());
        } catch (error) {
            console.error('Error submitting:', error);
        } finally {
            setIsSubmitting(false);
        }
    }

    function handleKeyPress(e: React.KeyboardEvent) {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    }

    return (
        <Modal title={title} handleOnClose={onClose}>
            <div className="flex flex-col gap-6 w-full">
                <p className="text-sm text-gray-600">Create a name for your new drawing</p>
                    <Input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={placeholder}
                        autoFocus
                    />
                <div className="flex gap-3">
                    <Button
                        onClick={!name.trim() || isSubmitting ? () => {} : handleSubmit}
                        className={!name.trim() || isSubmitting ? "opacity-50 cursor-not-allowed" : ""}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Creating..." : "Create"}
                    </Button>
                    <Button onClick={onClose} variant="secondary" disabled={isSubmitting}>
                        Cancel
                    </Button>
                </div>
            </div>
        </Modal>
    )
} 


