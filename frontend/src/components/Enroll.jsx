import React from 'react'

const Enroll = ({enrollFreelancerDetails,setfreelancerDetails,freelancerDetails}) => {
  return (
    <div>Enroll As FreeLancer
    <br />
    <br />
    <label>Name:</label>                 

{/* 
                                                //here {} called as object Literal

 */}    <input onChange={(e)=> setfreelancerDetails({...freelancerDetails,name:e.target.value})}></input> 
    <br />
    <label>Skills:</label>
    <input onChange={(e) => setfreelancerDetails({...freelancerDetails,skills:e.target.value})}></input>
    <br />
    <label>Bio:</label>
    <input onChange={(e) => setfreelancerDetails({...freelancerDetails,bio:e.target.value})}></input>
    <br />
    <label>Skills:</label>
    <input onChange={(e)=> setfreelancerDetails({...freelancerDetails,skills:e.target.value})}></input>
    <br/>
    <label>Amount:</label>
    <input onChange={(e)=> setfreelancerDetails({...freelancerDetails ,amount:e.target.value})}></input>
    <br/>
    <label>IsUsd:</label>
    {/* 
        to use like this
        ```<input type={checkbox} />``` need to have this
        <input type={checkbox} /> 
        because In JSX, curly braces {} are used to embed JavaScript expressions or variables.
        so for using the {} expects and javascript variable or constants
     */}
    <input type='checkbox' onChange={(e)=> setfreelancerDetails({...freelancerDetails,isUsd:e.target.checked})}>

    </input>
<br/>
<button onClick={enrollFreelancerDetails}>enroll</button>
<br/>


    
    </div>
  )
}

export default Enroll