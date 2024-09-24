import React,{useContext,useState,useEffect} from 'react'
import { AuthContext } from '../context/AuthProvider'
import axios from 'axios'

const UserProfile = () => {
    const { auth } = useContext(AuthContext);
  const { username,_id } = auth;
  const [user,setUser] = useState([])

  useEffect(()=>{
    const fetchData = async () =>{
      try{
        const response = await axios.get('http://localhost:5000/fetch-user',{params:{id:_id}})
        console.log(response)
        setUser(response.data.user)
      }catch(err){
        console.log(err)
      }
    }
    fetchData()
  })
  
    
  return (
    <div>
        Hello {username}
        <h1>User Details</h1>
       <p>Username : {user.username}</p>
       <p>Phone : {user.phone}</p>
       <p>Address : {user.address}</p>
       <p>Email : {user.email}</p>
    </div>
  )
}

export default UserProfile
