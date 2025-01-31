import jwt from "jsonwebtoken"

const generateAccesstoken = (user) =>{
  return jwt.sign({email : user.email},process.env.ACCESS_JWT_SECRET, {
   expiresIn : "6h"
  })
 }
 const generateRefreshtoken = (user) =>{
  return jwt.sign({email : user.email},process.env.REFRESH_JWT_SECRET, {
   expiresIn : "6h"
  })
 }

export {generateAccesstoken,generateRefreshtoken}