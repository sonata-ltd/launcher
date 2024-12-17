import NewsList from "@/ui/widgets/NewsList/NewsList";
import Instances from "@/ui/pages/Instances/instances";
import UIKitDebug from "@/ui/pages/UIKitDebug/uikitdebug";

export const routeNames = {
    root: "/",
    instances: "/instances",
    uidebug: "/uidebug",
}

export const routes = {
    [routeNames.root]: () => <NewsList />,
    [routeNames.instances]: () => <Instances />,
    [routeNames.uidebug]: () => <UIKitDebug />
}
