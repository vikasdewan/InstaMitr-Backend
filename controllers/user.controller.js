export const register = async(req,res)=>{
    try {

        const {username,email,password} = req.body;
        if(!email || !username || !password){
            return res.status(401).json({
                message : "something went wrong , please Check",
                success : false,
                })
        }

    } catch (error) {
        console.log(error)
    }
} 