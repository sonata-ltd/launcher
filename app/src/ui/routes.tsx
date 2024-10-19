import NewsList from "@/ui/widgets/newsList/NewsList";
import Instances from "@/ui/pages/Instances/Instances";
import UIKitDebug from "@/ui/pages/UIKitDebug/UIKitDebug";

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
