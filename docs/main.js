(function (Router) {
    let route = new (Router())();
    route.init();

    route.route("app", () => {
        console.log("route to app.");
    });

    let navDOMS = document.querySelectorAll("#menu > * a[href]");

    let navLists = [...navDOMS]
        .map((value) => {
            return value.hash;
        })
        .filter((value) => value != "");

    let getNextSectionHashTag = () => {
        if (navLists.indexOf(location.hash) == -1) {
            return -1;
        }
        return navLists.indexOf(location.hash) == navLists.length - 1
            ? -1
            : navLists[navLists.indexOf(location.hash) + 1];
    };

    let mainSections = document.querySelectorAll(".main-section");

    // omite the last section (length - 1)
    for (let i = 0; i < mainSections.length - 1; i++) {
        let nextSectionHyperLink = document.createElement("div");
        nextSectionHyperLink.classList.add("next-section-hyper-link");
        nextSectionHyperLink.innerHTML = `<a href='${
            navLists[i + 1]
        }'> ->Next: ${navLists[i + 1].replace("#", "")}</a>`;
        console.log(mainSections[i].appendChild(nextSectionHyperLink));
    }

    console.log(navLists);
})(function () {
    class Router {
        // Map<string, function>

        constructor() {
            this.routes = new Map();
            this.currentURL = "";
            this.state = {};
        }

        init() {
            window.addEventListener("load", this.refresh.bind(this), false);
            window.addEventListener(
                "hashchange",
                this.refresh.bind(this),
                false
            );
        }

        route(path, callback) {
            this.routes.set(path, callback || function () {});
        }

        clearAttribute(selector, attribute) {
            let doms = document.querySelectorAll(selector);

            for (let x of doms) {
                if (x.classList.contains(attribute))
                    x.classList.remove(attribute);
            }
        }

        changeNavigateBar(state) {
            let hashtag = document.querySelector(`a[href='${location.hash}']`);

            this.clearAttribute(".nav-link", "nav-link-selected");

            if (state) {
                hashtag.classList.add("nav-link-selected");
            } else {
                document
                    .querySelector(".nav-link")
                    .classList.add("nav-link-selected");
            }
        }

        displayFragment(hashTag) {
            hashTag = hashTag == "/" ? "Introduction" : hashTag;

            let hashTagSection = document.getElementById(hashTag);

            if (!hashTagSection) return;

            this.clearAttribute(".main-section", "view");

            hashTagSection.classList.add("view");
            console.log("true:dis");
        }

        refresh() {
            this.currentURL = location.hash.slice(1) || "/";

            // scrolling to the top of the page
            document.body.scrollTop = 0;

            console.log("currentURL:" + this.currentURL);
            if (this.currentURL && this.currentURL != "/") {
                // Invoke the function, if set-up the route method before.
                this.routes.get(this.currentURL)?.apply();
                this.changeNavigateBar(true);

                // display the selected section
                this.displayFragment(this.currentURL);
            } else {
                //moment styles to the first nav element
                this.changeNavigateBar(false);
                this.displayFragment(this.currentURL);
            }
        }
    }

    return Router;
});
