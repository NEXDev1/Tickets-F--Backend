const {
  addAgentDataDB,
  getAgentEntity,
  deleteEntity,
  getAgentOrders,
  getOrderIds,
} = require("../database/repository/agentRepository");
const { getAgent } = require("../database/repository/authRepository");
const Order = require("../database/models/OrderSchema")


const addEntity = async (req, res) => {
  try {
    console.log("Add Entity(res.body):", req.body);

    const { _id, drawTime, date, tokenSets } = req.body;

    // Fetch all orderId's from the Order schema and log them
    const allOrders = await Order.find({}, 'orderId'); // Assuming 'orderId' is the field name
    const orderIdsArray = allOrders.map(order => order.orderId);
    // console.log("All Order IDs:", orderIdsArray);

    const orderCount = allOrders.length;
    // console.log("Total Order Count:", orderCount);

    // Find the largest orderId
    const largestOrderNum = orderIdsArray.map(orderId => parseInt(orderId.slice(3))).sort((a, b) => b - a)[0];
    // console.log("Largest Order Number:", largestOrderNum);

    // Generate the new order ID
    const newOrderId = `ORD${largestOrderNum + 1}`;

    console.log("New Order Id :", newOrderId);

    let user = await getAgent(_id);
    // console.log("user", user);

    if (user) {
      // Create the new order document
      let result = await addAgentDataDB(_id, drawTime, date, newOrderId, tokenSets);

      console.log(result);
      res.status(200).json({ status: "success", result });
    } else {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};






const listEntity = async (req, res) => {
  try {
    console.log("agent", req.body);
    const { _id } = req.body;
    const listEntity = await getAgentEntity(_id);
    if (listEntity == null) {
      res.status(500).json({ error: error.message });
    }

    res.status(200).json({ status: "success", listEntity:listEntity.data,total:listEntity.totalTokenCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const listOrder = async (req, res) => {
  try {
    console.log("agent", req.body);
    const { _id } = req.body;
    const listOrder = await getAgentOrders(_id);
    if (listOrder == null) {
      res.status(500).json({ error: error.message });
    }
    res.status(200).json({ status: "success", listOrder });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteEntityAgent = async (req, res) => {
  try {
    console.log("deleteagent", req.body);
    const { id } = req.body;
    const result = await deleteEntity(id);

    res.status(200).json({ status: "success", result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getOrders = async (req, res) => {
  try {
    const orderIds = await getOrderIds();
    res.status(200).json({  orderIds });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { addEntity, listEntity,listOrder, deleteEntityAgent,getOrders };
