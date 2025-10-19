'use client'
import "./footer.styles.css"
import { ChevronDoubleUpIcon } from "@heroicons/react/20/solid"
import { useRouter } from "next/navigation"

export default function Footer() {
    const router = useRouter()
    return (
        <footer 
            className="Footer-Styles flex flex-col bg-[url('/banner_web_minpro_v1.png')] mt-auto">
            <button 
                title="Back To HomePage" 
                className="justify-items-center scroll-smooth" onClick={() => router.push("/")}>
                <ChevronDoubleUpIcon className=
                    "Back-to-HomePage size-11 text-sky-500 sm:size-16 cursor-pointer hover:bg-gray-600 p-1 rounded-md" 
                />
            </button>

            <div 
                className= "Footer-Botton-Styles ml-auto mr-auto text-base text-center tracking-widest sm:text-lg"
                > BACK TO HOMEPAGE
            </div>

            <div className=
                "License-Caption-Styles text-xs text-center tracking-widest sm:text-sm/10">
                © 2025 TuneInLive. All rights reserved.
            </div>
        </footer>
    )
}