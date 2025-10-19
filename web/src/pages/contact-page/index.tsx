import { InboxArrowDownIcon } from "@heroicons/react/16/solid";

export default function ContactUs() {
    return (
        <div className="Contact-Section">
            <h1 className="font-bold text-3xl ml-5 mt-5"
                > Contact
            </h1>
            <div className="flex flex-col p-5">
                <h2 className="text-lg mb-5">
                    Get in touch with Us!
                </h2>
                <p className="text-base text-justify pb-28">
                    We are always open to feedback and suggestions. 
                    If you have any questions or would like to collaborate, 
                    feel free to reach out via email at:
                    <a  href="mailto:minitiketproject@gmail.com" 
                        className="text-blue-900 hover:underline">
                    <InboxArrowDownIcon className="size-11 text-blue-500 md:size-12" />
                    </a>
                </p>
            </div>
        </div>
    );
}