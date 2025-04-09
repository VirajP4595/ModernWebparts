import { SPFx, spfi, SPFI } from "@pnp/sp";
import "@pnp/sp/webs"; // Import webs functionality
import "@pnp/sp/lists"; // Import lists functionality
import "@pnp/sp/items"; // Import items functionality

let sp: SPFI;

export const getSP = (context: any): SPFI => {
  if (!sp) {
    sp = spfi().using(SPFx(context));
  }
  return sp;
};