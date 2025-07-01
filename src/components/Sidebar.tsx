import { FiEdit3, FiFilePlus, FiPlus, FiSave } from "react-icons/fi";


function SidebarButton({ label, onClick, Icon }: { label: string, onClick: () => void, Icon: React.ElementType }) {
    return (
        <button onClick={onClick} className="flex flex-col items-center justify-center hover:bg-[--excali-light-purple] rounded-lg p-2 hover:text-[--excali-dark-purple]">
            <Icon className="w-4 h-4 text-[--nimue-dark-gray]" />
        </button>
    )
}

export default function Sidebar() {
    return (
        <div className="flex flex-col gap-6 items-center py-4 px-2">
            <div className="bg-white rounded-lg shadow-md p-2 border border-gray-200 flex flex-col justify-start gap-2 items-center">
                {[
                    {
                        label: "New",
                        icon: FiPlus,
                        onClick: () => {
                            console.log("New")
                        }
                    },
                    {
                        label: "Save",
                        icon: FiSave,
                        onClick: () => {
                            console.log("Save")
                        }
                    },
                    {
                        label: "Save as",
                        icon: FiFilePlus,
                        onClick: () => {
                            console.log("Save as")
                        }
                    },
                    {
                        label: "Open",
                        icon: FiEdit3,
                        onClick: () => {
                            console.log("Open")
                        }
                    }
                ].map((button) => (
                    <SidebarButton
                        key={button.label}
                        label={button.label}
                        onClick={button.onClick}
                        Icon={button.icon}
                    />
                ))}
            </div>
        </div>
    )
}