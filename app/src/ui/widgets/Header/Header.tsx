import { ref } from 'hywer';
import { routeNames, routes } from '@/ui/Routes';

import './Header.css';
// import { navigateTo } from 'hywer/x/router';

import { HomeTabLogo } from '@/ui/components/icons/HomeTab';
import { DiscoverTabLogo } from '@/ui/components/icons/DiscoverTab';
import { InstancesTabLogo } from '@/ui/components/icons/InstancesTab';
import { ToolsTabLogo } from '@/ui/components/icons/ToolsTab';


const icons = {
    root: <HomeTabLogo />,
    instances: <InstancesTabLogo />,
    uidebug: <ToolsTabLogo />,
}

const names = {
    root: "Home",
    instances: "Instances",
    uidebug: "UIDebug",
}


function Header() {
    const tabPos = ref(0);
    const activeTabs = ref<Record<string, boolean>>({});
    const tabsScroll: Record<number, number> = {};

    const changeTabPos = (pos: number, url: keyof typeof routeNames) => {
        tabsScroll[tabPos.val] = window.scrollY;

        if (tabPos.val !== pos) {
            window.history.pushState({}, '', routeNames[url]);
            tabPos.val = pos;

            activeTabs.val = {
                ...activeTabs.val,
                [routeNames[url]]: true
            };

            setTimeout(() => {
                window.scrollTo(0, tabsScroll[pos] || 0);
            })
        }
    }


    return (
        <>
        <div className="header">
            <div className="header-menus" id="header-menus">
                {Object.entries(routeNames).map(([key, value], index) => (
                    <div
                        key={key}
                        onClick={() => changeTabPos(index, key as keyof typeof routeNames)}
                        className={tabPos.derive(val => `header-tab ${val === index ? 'header-active-tab' : ''}`)}
                    >
                        {icons[key as keyof typeof icons]}
                        <p>{names[key as keyof typeof names]}</p>
                    </div>
                ))}
            </div>
        </div>
        <div id="content-view">
            {Object.entries(routes).map(([key, Component], index) => (
                <div
                    key={key}
                    style={tabPos.derive(val => `display: ${val === index ? 'block' : 'none'} `)}
                >
                    <Component />
                </div>
            ))}
        </div>
        </>
    )
}

export default Header;
