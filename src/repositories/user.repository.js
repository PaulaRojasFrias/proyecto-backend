const UserModel = require("../models/user.model.js");

class UserRepository {
  async findByEmail(email) {
    try {
      return await UserModel.findOne({ email });
    } catch (error) {
      throw error;
    }
  }

  async findById(id) {
    try {
      return await UserModel.findById(id);
    } catch (error) {
      throw error;
    }
  }

  async create(user) {
    try {
      return await user.save();
    } catch (error) {
      throw error;
    }
  }

  async save(user) {
    try {
      return await user.save();
    } catch (error) {
      throw error;
    }
  }

  async updateUserRole(userId, newRole) {
    try {
      const user = await UserModel.findById(userId);

      if (!user) {
        throw new Error("Usuario no encontrado");
      }
      const requiredDocuments = [
        "Identificación",
        "Comprobante de domicilio",
        "Comprobante de estado de cuenta",
      ];
      const userDocuments = user.documents.map((doc) => doc.name);

      const hasRequiredDocuments = requiredDocuments.every((doc) =>
        userDocuments.includes(doc)
      );

      if (!hasRequiredDocuments) {
        throw new Error(
          "El usuario debe cargar los siguientes documentos: Identificación, Comprobante de domicilio, Comprobante de estado de cuenta"
        );
      }

      return await UserModel.findByIdAndUpdate(
        userId,
        { role: newRole },
        { new: true }
      );
    } catch (error) {
      throw error;
    }
  }

  async getUsers() {
    try {
      const users = await UserModel.find({}, "first_name last_name email role");
      return users;
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      throw error;
    }
  }

  async deleteInactiveUsers(lastConnectionDate) {
    try {
      const result = await UserModel.deleteMany({
        last_connection: { $lt: lastConnectionDate },
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(userId) {
    try {
      const deletedUser = await UserModel.findByIdAndDelete(userId);
      return deletedUser;
    } catch (error) {
      throw error;
    }
  }

  async updateUserRolebyId(userId, newRole) {
    try {
      const user = await UserModel.findById(userId);

      if (!user) {
        throw new Error("Usuario no encontrado");
      }

      user.role = newRole;
      await user.save();

      return user;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UserRepository;
