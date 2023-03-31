function checkBody(body, template){
  for(const key in template){
    if(!body[key]) return false;
  }

  return true

}

module.exports= { checkBody };