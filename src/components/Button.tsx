


const VARIANTS = {
    "primary": "bg-[--excali-purple] text-white",
    "secondary": "bg-white text-[--excali-purple] border border-[--excali-purple]",
}


export default function Button({ children, onClick, className, variant = "primary", disabled = false }:
    { children: React.ReactNode, onClick: () => void, className?: string, variant?: "primary" | "secondary", disabled?: boolean }) {
    return (
        <button 
            className={`text-sm font-bold px-4 py-2 rounded-md ${VARIANTS[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`} 
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    )
}