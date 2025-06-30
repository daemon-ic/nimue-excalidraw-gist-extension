


const VARIANTS = {
    "primary": "bg-[--excali-purple] text-white",
    "secondary": "bg-white text-[--excali-purple] border border-[--excali-purple]",
}


export default function Button({ children, onClick, className, variant = "primary" }:
    { children: React.ReactNode, onClick: () => void, className?: string, variant?: "primary" | "secondary" }) {
    return (
        <button className={`text-sm font-bold px-4 py-2 rounded-md ${VARIANTS[variant]} ${className}`} onClick={onClick}>
            {children}
        </button>
    )
}