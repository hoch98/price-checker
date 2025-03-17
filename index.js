import { request } from "axios";

const display = new Display();
display.addLine("Item: ????");
display.addLine("Price LBIN (Clean): ????");
display.addLine("Price Recent (Match): ????");

function getPrice(itemId, attributes) {
  urlcall = 'https://sky.coflnet.com/api/auctions/tag/'+itemId+'/active/bin?'
  if (attributes != undefined) {
    urlcall = 'https://sky.coflnet.com/api/auctions/tag/'+itemId+'/recent/overview?'
    let recombobulated = attributes.getInteger("rarity_upgrades") == 1.0
    if (recombobulated) urlcall += "Recombobulated=true"
    if (enchantments = attributes.get("enchantments")) {
      let enchantments = attributes.get("enchantments").toObject()
      Object.keys(enchantments).forEach((key) => {
        urlcall += "&"+key+"="+enchantments[key]
      })
    }
  }
  try {
    return request({
        url: urlcall,
        method: 'GET',
    })
  } catch (e) {
    // ChatLib.chat("request failed: "+e)
  }
}


function formatNumber(num) {
  if (num >= 1_000_000_000) {
      return `${(num / 1_000_000_000).toFixed(2)}b`;
  } else if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(2)}m`;
  } else if (num >= 1_000) {
      return `${(num / 1_000).toFixed(2)}k`;
  } else {
      return num.toString();
  }
}

let item = undefined
register('step', () => {
  try {
    let slot = Client.currentGui.getSlotUnderMouse()
    if (slot) {
        if (item != undefined) {
          if (item.getRawNBT() === Player.getContainer().getStackInSlot(slot.getIndex()).getRawNBT()) {
            return false;
          }
        }
        item = Player.getContainer().getStackInSlot(slot.getIndex())
        let lore = item.getLore();
        let attributes = item.getNBT().getCompoundTag("tag").getCompoundTag("ExtraAttributes")
        let itemId = attributes.getString("id");
        if (itemId == "PET") {
          itemId = "PET_"+JSON.parse(JSON.parse(attributes.get("petInfo")))["type"]
        }
        getPrice(itemId).then((data) => {
          let name = lore[0]
          if (data.data == []) {
            display.setLine(0,"Item: "+name)
            display.setLine(1,"Price LBIN (Clean): No data found")
            return false
          }
          let price = formatNumber(parseInt(data.data[0]["startingBid"]))
          display.setLine(0,"Item: "+name)
          display.setLine(1,"Price LBIN (Clean): "+price)
        })
        getPrice(itemId, attributes).then((data) => {
          if (data.data == []) {
            display.setLine(2,"Price Recent (Match): No data found")
            return false
          }
          let price = formatNumber(parseInt(data.data[0]["price"]))
          display.setLine(2,"Price Recent (Match): "+price)
          console.log(data.data[0].uuid)
        })

    } else {
      display.setLine(0,"Item: ????")
      display.setLine(1,"Price LBIN (Clean): ????")
      display.setLine(2,"Price Recent (Match): ????")
    }
  } catch (e) {
    // ChatLib.chat("Error: "+e)
  }
}).setDelay(1)


display.setRenderLoc(10, 10);
display.setBackground(DisplayHandler.Background.PER_LINE);
display.setBackground("per line");

