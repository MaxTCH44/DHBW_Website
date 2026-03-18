import { Button } from "@mantine/core";
import { Link } from "react-router-dom";
import { IconChevronRight } from '@tabler/icons-react';



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