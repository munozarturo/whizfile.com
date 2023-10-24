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
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M9 9L27 27"
        stroke={props.fill || "white"}
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  ),
};