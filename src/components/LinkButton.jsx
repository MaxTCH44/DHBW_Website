import { Button } from "@mantine/core";
import { Link } from "react-router-dom";
import { IconChevronRight } from '@tabler/icons-react';

/**
 * A simple, reusable navigation button that integrates Mantine's UI with React Router.
 * It strictly acts as a hyperlink disguised as a button, complete with a right-pointing chevron 
 * to indicate forward navigation or reading more.
 * * @param {Object} props
 * @param {string} props.link - The target path for React Router navigation.
 * @param {string|React.ReactNode} props.label - The text displayed inside the button.
 */
export default function LinkButton({ link, label }){
    return(
        <Button
            component={Link}
            to={link}
            leftSection={<IconChevronRight />}
        >
            {label}
        </Button>
    )
}