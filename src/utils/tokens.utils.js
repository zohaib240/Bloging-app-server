import jwt from "jsonwebtoken"

const generateAccesstoken = (user) =>{
  return jwt.sign({email : user.email, id : user._id},process.env.ACCESS_JWT_SECRET, {
   expiresIn : "6h"
  })
 }
 const generateRefreshtoken = (user) =>{
  return jwt.sign({email : user.email, id : user._id},process.env.REFRESH_JWT_SECRET, {
   expiresIn : "6h"
  })
 }

export {generateAccesstoken,generateRefreshtoken}