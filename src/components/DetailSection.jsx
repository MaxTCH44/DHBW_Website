import { Anchor, Collapse, Card } from "@mantine/core"

/**
 * A reusable collapsible accordion component.
 * Used primarily in the Calculator to hide advanced technical parameters (like carbon tax 
 * or max stacks limit) and keep the main user interface clean and accessible.
 * * @param {Object} props
 * @param {boolean} props.openedSections - The current visibility state of this specific section.
 * @param {Function} props.toggleSection - Callback to toggle the visibility state.
 * @param {React.ReactNode} props.children - The advanced inputs or content to be hidden/revealed.
 */
export default function DetailSection({ openedSections, toggleSection, children }){
    return(
        <>
            <Collapse in={openedSections}>
                <Card bg="green.2">
                    {children}
                </Card>
            </Collapse>
            <Anchor 
                component="button" 
                type="button" 
                size="sm" 
                c="dimmed" 
                mb="sm" 
                mt={openedSections ? "xs" : ""} 
                onClick={toggleSection}
            >
                {openedSections ? "Hide details" : "Show details"}
            </Anchor>
        </>
    )
}