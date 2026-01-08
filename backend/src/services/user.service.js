import User from "../models/user.model.js";

class UserService {
  async updateProfile(userId, profileData) {
    const { full_name, avatar_url } = profileData;

    const updateData = {};
    if (full_name !== undefined) updateData.full_name = full_name;
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;

    if (Object.keys(updateData).length === 0) {
      throw new Error("Không có dữ liệu để cập nhật");
    }

    const [updatedRows] = await User.update(updateData, {
      where: { id: userId },
    });

    if (updatedRows === 0) {
      throw new Error("User không tồn tại");
    }

    // Fetch updated user data
    const updatedUser = await User.findOne({
      where: { id: userId },
      attributes: { exclude: ["hash_password", "refresh_token"] },
    });

    return updatedUser;
  }

  async uploadAvatar(userId, file) {
    if (!file) {
      throw new Error("Không có file được upload");
    }

    // Create the avatar URL path
    const avatarUrl = `/uploads/avatars/${file.filename}`;

    // Update user's avatar_url
    const [updatedRows] = await User.update(
      { avatar_url: avatarUrl },
      { where: { id: userId } }
    );

    if (updatedRows === 0) {
      throw new Error("User không tồn tại");
    }

    // Fetch updated user data
    const updatedUser = await User.findOne({
      where: { id: userId },
      attributes: { exclude: ["hash_password", "refresh_token"] },
    });

    return updatedUser;
  }
}

export default new UserService();
