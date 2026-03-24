import { Anchor, Collapse, Card } from "@mantine/core"



export default function DetailSection({ openedSections, toggleSection, children }){
    return(
        <>
            <Collapse in={openedSections}>
                <Card bg="green.0">
                    {children}
                </Card>
            </Collapse>
            <Anchor component="button" type="button" size="sm" c="dimmed" mb="sm" mt={openedSections ? "xs" : ""} onClick={toggleSection}>
                {openedSections ? "Hide details" : "Show details"}
            </Anchor>
        </>
    )
}