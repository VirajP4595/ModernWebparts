import { getSP } from "../../../helper/pnpjsConfig";
import IGlobalNavItem from "../model/IGlobalNavItem";
import ISPGlobalNavItem from "../model/ISPGlobalNavItem";
import { ApplicationCustomizerContext } from "@microsoft/sp-application-base";

export default class GlobalNavProvider {
  private context: ApplicationCustomizerContext;

  constructor(context: ApplicationCustomizerContext) {
    this.context = context;
  }

  public async getGlobalNavigation(): Promise<IGlobalNavItem[]> {
    const sp = getSP(this.context);
    const results = await sp.web.lists
      .getByTitle("Global Nav List")
      .items.select(
        "Title",
        "Id",
        "GlobalNavUrl",
        "GlobalNavOpenInNewWindow",
        "GlobalNavParent/Title",
        "GlobalNavSecured"
      )
      .top(2000)
      .expand("GlobalNavParent/Title")
      .orderBy("GlobalNavOrder")
      .orderBy("Title")()

    console.log(results);
    return this.parseGlobalNavigationNodes(results);
  }


  private parseGlobalNavigationNodes(spGlobalNavItems: ISPGlobalNavItem[]): Promise<IGlobalNavItem[]> {
    return new Promise((resolve, reject) => {
      let depth: number = 0;
      let globalNavItems: IGlobalNavItem[] = [];
      spGlobalNavItems.forEach(
        (item: ISPGlobalNavItem): void => {
          //if (!item.GlobalNavParent.Title) {
          globalNavItems.push({
            title: item.Title,
            id: item.Id,
            url: item.GlobalNavUrl,
            openInNewWindow: item.GlobalNavOpenInNewWindow ?? false,
            subNavItems: this.getSubNavItems(spGlobalNavItems, item.Title, depth + 1),
            level: depth,
            secured: item.GlobalNavSecured ?? false
          });
          //}
        }
      );
      resolve(globalNavItems);
    });
  }

  private getSubNavItems(
    spNavItems: ISPGlobalNavItem[],
    filter: string,
    depth: number
  ): IGlobalNavItem[] {
    let subNavItems: IGlobalNavItem[] = [];
    spNavItems.forEach(
      (item: ISPGlobalNavItem): void => {
        if (item.GlobalNavParent != undefined && item.GlobalNavParent.Title === filter) {
          subNavItems.push({
            title: item.Title,
            id: item.Id,
            url: item.GlobalNavUrl,
            openInNewWindow: item.GlobalNavOpenInNewWindow ?? false,
            subNavItems: this.getSubNavItems(spNavItems, item.Title, depth + 1),
            level: depth,
            secured: item.GlobalNavSecured ?? false
          });
        }
      }
    );
    return subNavItems.length > 0 ? subNavItems : [];
  }
}
