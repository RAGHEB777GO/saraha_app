import bcrypt from "bcrypt";


export const hashPassword = async (password) => {
  const salt = 10;
  return await bcrypt.hash(password, salt);
};
