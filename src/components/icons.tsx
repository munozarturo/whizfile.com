import { type XIcon as LucideIcon, type LucideProps } from "lucide-react";

export type Icon = typeof LucideIcon;

export const Icons = {
    upload: (props: LucideProps) => (
        <svg
            width="36"
            height="36"
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M7.85778 22.2176C8.45601 24.4502 9.77424 26.4231 11.608 27.8302C13.4418 29.2373 15.6886 30 18 30C20.3114 30 22.5582 29.2373 24.392 27.8302C26.2258 26.4231 27.544 24.4502 28.1422 22.2176"
                stroke={props.fill || "white"}
                strokeWidth="3"
            />
            <path
                d="M18 6L17.063 4.8287L18 4.07906L18.937 4.8287L18 6ZM19.5 19.5C19.5 20.3284 18.8284 21 18 21C17.1716 21 16.5 20.3284 16.5 19.5L19.5 19.5ZM9.56296 10.8287L17.063 4.8287L18.937 7.1713L11.437 13.1713L9.56296 10.8287ZM18.937 4.8287L26.437 10.8287L24.563 13.1713L17.063 7.1713L18.937 4.8287ZM19.5 6L19.5 19.5L16.5 19.5L16.5 6L19.5 6Z"
                fill={props.fill || "white"}
            />
        </svg>
    ),
    download: (props: LucideProps) => (
        <svg
            width={props.width || "36"}
            height={props.height || "36"}
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M7.85778 22.2176C8.45601 24.4502 9.77424 26.4231 11.608 27.8302C13.4418 29.2373 15.6886 30 18 30C20.3114 30 22.5582 29.2373 24.392 27.8302C26.2258 26.4231 27.544 24.4502 28.1422 22.2176"
                stroke={props.fill || "white"}
                strokeWidth="3"
            />
            <path
                d="M18 19.5L17.063 20.6713L18 21.4209L18.937 20.6713L18 19.5ZM19.5 6C19.5 5.17157 18.8284 4.5 18 4.5C17.1716 4.5 16.5 5.17157 16.5 6L19.5 6ZM9.56296 14.6713L17.063 20.6713L18.937 18.3287L11.437 12.3287L9.56296 14.6713ZM18.937 20.6713L26.437 14.6713L24.563 12.3287L17.063 18.3287L18.937 20.6713ZM19.5 19.5L19.5 6L16.5 6L16.5 19.5L19.5 19.5Z"
                fill={props.fill || "white"}
            />
        </svg>
    ),
    add: (props: LucideProps) => (
        <svg
            width={props.width || "36"}
            height={props.height || "36"}
            viewBox="0 0 36 36"
            fill={props.fill || "white"}
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 4.5C7.85786 4.5 4.5 7.85786 4.5 12V24C4.5 28.1421 7.85786 31.5 12 31.5H24C28.1421 31.5 31.5 28.1421 31.5 24V12C31.5 7.85786 28.1421 4.5 24 4.5H12ZM18 9.00021C19.2426 9.00021 20.25 10.0076 20.25 11.2502V15.7491H24.75C25.9926 15.7491 27 16.7565 27 17.9991C27 19.2418 25.9926 20.2491 24.75 20.2491H20.25V24.7502C20.25 25.9928 19.2426 27.0002 18 27.0002C16.7574 27.0002 15.75 25.9928 15.75 24.7502V20.2491H11.25C10.0074 20.2491 9 19.2418 9 17.9991C9 16.7565 10.0074 15.7491 11.25 15.7491H15.75V11.2502C15.75 10.0076 16.7574 9.00021 18 9.00021Z"
                fill={props.fill || "white"}
            />
        </svg>
    ),
    cross: (props: LucideProps) => (
        <svg
            width={props.width || "36"}
            height={props.height || "36"}
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M27 9L9 27"
                stroke={props.fill || "white"}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M9 9L27 27"
                stroke={props.fill || "white"}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    ),
    copy: (props: LucideProps) => (
        <svg
            width={props.width || "36"}
            height={props.height || "36"}
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M21 10.5V10.5C21 9.10218 21 8.40326 20.7716 7.85195C20.4672 7.11687 19.8831 6.53284 19.1481 6.22836C18.5967 6 17.8978 6 16.5 6H12C9.17157 6 7.75736 6 6.87868 6.87868C6 7.75736 6 9.17157 6 12V16.5C6 17.8978 6 18.5967 6.22836 19.1481C6.53284 19.8831 7.11687 20.4672 7.85195 20.7716C8.40326 21 9.10218 21 10.5 21V21"
                stroke={props.fill || "white"}
                strokeWidth="3"
            />
            <rect
                x="15"
                y="15"
                width="15"
                height="15"
                rx="3"
                stroke={props.fill || "white"}
                strokeWidth="3"
            />
        </svg>
    ),
    info: (props: LucideProps) => (
        <svg
            width={props.width || "36"}
            height={props.height || "36"}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21ZM12 7C11.4477 7 11 7.44772 11 8C11 8.55228 11.4477 9 12 9H12.01C12.5623 9 13.01 8.55228 13.01 8C13.01 7.44772 12.5623 7 12.01 7H12ZM10.5 11C9.94772 11 9.5 11.4477 9.5 12C9.5 12.5523 9.94772 13 10.5 13H11V16C11 16.5523 11.4477 17 12 17H14C14.5523 17 15 16.5523 15 16C15 15.4477 14.5523 15 14 15H13V12C13 11.4477 12.5523 11 12 11H10.5Z"
                fill={props.fill || "white"}
            />
        </svg>
    ),
    chevronDown: (props: LucideProps) => (
        <svg
            width={props.width || "36"}
            height={props.height || "36"}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M18 9L12 15L6 9"
                stroke={props.fill || "white"}
                strokeWidth="2"
            />
        </svg>
    ),
    remove: (props: LucideProps) => (
        <svg
            width={props.width || "36"}
            height={props.height || "36"}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21ZM7 13H17V11H7V13Z"
                fill={props.fill || "white"}
            />
        </svg>
    ),
    file: (props: LucideProps) => (
        <svg
            width={props.width || "36"}
            height={props.height || "36"}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M13.1716 3H9C7.11438 3 6.17157 3 5.58579 3.58579C5 4.17157 5 5.11438 5 7V17C5 18.8856 5 19.8284 5.58579 20.4142C6.17157 21 7.11438 21 9 21H15C16.8856 21 17.8284 21 18.4142 20.4142C19 19.8284 19 18.8856 19 17V8.82843C19 8.41968 19 8.2153 18.9239 8.03153C18.8478 7.84776 18.7032 7.70324 18.4142 7.41421L14.5858 3.58579C14.2968 3.29676 14.1522 3.15224 13.9685 3.07612C13.7847 3 13.5803 3 13.1716 3Z"
                stroke={props.fill || "white"}
                strokeWidth="2"
            />
            <path
                d="M9 13L15 13"
                stroke={props.fill || "white"}
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M9 17L13 17"
                stroke={props.fill || "white"}
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M13 3V7C13 7.94281 13 8.41421 13.2929 8.70711C13.5858 9 14.0572 9 15 9H19"
                stroke={props.fill || "white"}
                strokeWidth="2"
            />
        </svg>
    ),
    import: (props: LucideProps) => (
        <svg
            width={props.width || "36"}
            height={props.height || "36"}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M12 14L11.2929 14.7071L12 15.4142L12.7071 14.7071L12 14ZM13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44771 11 5L13 5ZM6.29289 9.70711L11.2929 14.7071L12.7071 13.2929L7.70711 8.29289L6.29289 9.70711ZM12.7071 14.7071L17.7071 9.70711L16.2929 8.29289L11.2929 13.2929L12.7071 14.7071ZM13 14L13 5L11 5L11 14L13 14Z"
                fill={props.fill || "white"}
            />
            <path
                d="M5 16L5 17C5 18.1046 5.89543 19 7 19L17 19C18.1046 19 19 18.1046 19 17V16"
                stroke={props.fill || "white"}
                stroke-width="2"
            />
        </svg>
    ),
    view: (props: LucideProps) => (
        <svg
            width={props.width || "36"}
            height={props.height || "36"}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <circle
                cx="12"
                cy="12"
                r="3"
                stroke={props.fill || "white"}
                strokeWidth="2"
            />
            <path
                d="M20.188 10.9343C20.5762 11.4056 20.7703 11.6412 20.7703 12C20.7703 12.3588 20.5762 12.5944 20.188 13.0657C18.7679 14.7899 15.6357 18 12 18C8.36427 18 5.23206 14.7899 3.81197 13.0657C3.42381 12.5944 3.22973 12.3588 3.22973 12C3.22973 11.6412 3.42381 11.4056 3.81197 10.9343C5.23206 9.21014 8.36427 6 12 6C15.6357 6 18.7679 9.21014 20.188 10.9343Z"
                stroke={props.fill || "white"}
                strokeWidth="2"
            />
        </svg>
    ),
};
