import Modal from "./Modal"
import Button from "./Button"
import { useInput } from "@/hooks/common";

export default function ConnectModal({ onClose }: { onClose: () => void }) {
    const githubTokenInput = useInput("")

    return (
        <Modal title="Connect to Github" handleOnClose={onClose}>
            <div className="flex flex-col gap-4 w-full">
                <p>Connect to Github to get started</p>
                <input
                    type="text"
                    value={githubTokenInput.value}
                    onChange={githubTokenInput.onChange}
                    className="border border-gray-300 rounded-md p-2"
                    placeholder="Github Token"
                />
                <div className="flex gap-3">
                    <Button onClick={onClose}>
                        Connect
                    </Button>
                    <Button onClick={onClose} variant="secondary">
                        Cancel
                    </Button>
                </div>
            </div>
        </Modal>
    )
}