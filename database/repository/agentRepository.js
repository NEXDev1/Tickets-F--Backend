const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const Order = require("../models/OrderSchema");
const Token = require("../models/TokenSchema");


const addAgentDataDB = async (userId, drawTime, date, orderId, tokenList) => {
  try {
    const newOrder = new Order({
      userId: new ObjectId(userId),
      date: date,
      drawTime: drawTime,
      orderId: orderId,
      isImport: 0
    });

    console.log("NewOrder is here : ", newOrder);

    const savedOrder = await newOrder.save();
    console.log("Order saved successfully");

    const tokenPromises = tokenList.map(async (token) => {
      const newToken = new Token({
        tokenNumber: token.tokenNumber,
        count: parseInt(token.count),
        orderId: savedOrder._id,
        isImport: 0
      });

      console.log("New Token:", newToken);
      return await newToken.save();
    });

    const savedTokens = await Promise.all(tokenPromises);

    return { order: savedOrder, tokens: savedTokens };
  } catch (error) {
    console.error("Error saving order or tokens:", error);
    throw error;
  }
};









// const addAgentDataDB = async (userId, drawTime, date, orderId, tokenList) => {
//   console.log("OrderId : ",orderId);
//   try {
//     // Creating a new order object with all required fields
//     const newOrder = new Order({
//       userId: new ObjectId(userId),
//       date: date,
//       drawTime: drawTime,
//       orderId: orderId, 
//       isImport: 0
//     });

//     console.log("ewOrder is here", newOrder);

//     // Saving the new order to the database
//     const savedUserData = await newOrder.save();

//     console.log("Order saved successfully:", savedUserData);

//     // Mapping over tokenList to create and save each token
//     const tokenPromises = tokenList.map(async (token) => {
//       const newToken = new Token({
//         tokenNumber: token.tokenNumber,
//         count: parseInt(token.count),
//         orderId: savedUserData._id,
//         isImport: 0
//       });

//       console.log("New Token :", newToken);

//       return await newToken.save();
//     });

//     // Waiting for all token promises to be resolved
//     const savedTokens = await Promise.all(tokenPromises);

//     return { order: savedUserData, tokens: savedTokens };
//   } catch (error) {
//     console.error("Error saving order or tokens:", error);
//     throw error;
//   }
// };

// module.exports = addAgentDataDB;






const getAgentEntity = async (id) => {
  try {
    console.log("getAgentEntity in db ", id);
    const _id = new mongoose.Types.ObjectId(id);
    console.log(_id);

    const list = await Order.aggregate([
      {
        $match: {
          userId: _id,
        },
      },
      {
        $lookup: {
          from: "tokens",
          localField: "_id",
          foreignField: "orderId",
          as: "token",
        },
      },
      {
        $unwind: {
          path: "$token",
        },
      },
      {
        $project: {
          _id: 1,
          userId: 1,
          date: 1,
          drawTime: 1,
          orderId: 1,
          tokenId: "$token._id",
          tokenNumber: "$token.tokenNumber",
          tokenCount: "$token.count",
        },
      },
    ]);

    let totalTokenCount = 0;

    if (list && list.length > 0) {
      // Calculate totalTokenCount separately
      totalTokenCount = list.reduce((sum, item) => sum + item.tokenCount, 0);
    }

    if (!list || list.length === 0) {
      return null;
    } else {
      return {
        data: list,
        totalTokenCount: totalTokenCount,
      };
    }
  } catch (error) {
    console.error("Error fetching agent entities:", error);
    throw error;
  }
};



   
 

const getAgentOrders = async (id) => {
  try {
    const _id = new mongoose.Types.ObjectId(id);
    console.log(_id);

    const list = await Order.aggregate([
      {
        $match: {
          userId: new ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "tokens",
          localField: "_id",
          foreignField: "orderId",
          as: "token",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $addFields: {
          total: {
            $sum: "$token.count"
          },
          agent: {
            $arrayElemAt: ["$user.name", 0], // Assuming there's only one user per order
          },
        }
      },
    ]);
    if (!list || list.length === 0) {
      return null;
    } else {
      return list;
    }
  } catch (error) {
    console.error("Error fetching agent entities:", error);
    throw error;
  }
};

const deleteEntity = async (orderId) => {
  try {
    console.log("deleteAgentOrder in db ", orderId);
    const _id = new mongoose.Types.ObjectId(orderId);
    console.log(_id);
    const deleteTokens = await Token.deleteMany({ orderId: _id });
    const deleteOrder = await Order.deleteOne({ _id });
    return { deleteTokens, deleteOrder };
  } catch (error) {
    console.error("Error fetching agent entities:", error);
    throw error;
  }
};

const getOrderIds = async () => {
  try {
    const orderIds = await Order.find();
    return orderIds;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  addAgentDataDB,
  getAgentEntity,
  getAgentOrders,
  deleteEntity,
  getOrderIds,
};
