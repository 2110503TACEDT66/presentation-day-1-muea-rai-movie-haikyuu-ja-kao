const CoWorkingSpace = require('../models/CoWorkingSpace');

//@desc Get all coWorkingSpaces
//@route GET /api/v1/coWorkingSpace
//@access Public
exports.getCoWorkingSpaces=async(req,res,next)=>{
    let query;

    //Copy req.query
    const reqQuery= {...req.query};

    //Fields to exclude
    const removeFields=['select','sort','page','limit'];

    //Loop over remove fields and delete them from reqQuery
    removeFields.forEach(param=>delete reqQuery[param]);
    console.log(reqQuery);

    //Create query string
    let queryStr=JSON.stringify(reqQuery);

    //Create operators ($gt, $gte,, etc)
    queryStr=queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match=>`$${match}`);

    //finding resource
    query=CoWorkingSpace.find(JSON.parse(queryStr)).populate(`reservations`);

    //Select Fields
    if(req.query.select){
        const fields=req.query.select.split(',').join(' ');
        query=query.select(fields);
    }
    //Sort
    if(req.query.sort){
        const sortBy = req.query.sort.split(',').join(' ');
        query=query.sort(sortBy);
    } else{
        query=query.sort('name');
    }

    //Pagination
    const page=parseInt(req.query.page,10)||1;
    const limit = parseInt(req.query.limit,10)||25;
    const startIndex = (page-1)*limit;
    const endIndex=page*limit;

    try{
        const total=await CoWorkingSpace.countDocuments();
        query=query.skip(startIndex).limit(limit);
        //Execute query
        const coWorkingSpaces = await query;
        console.log(req.query);


        //Pagination result
        const pagination={};

        if(endIndex<total){
            pagination.next={
                page:page+1,
                limit
            }
        }

        if(startIndex>0){
            pagination.prev={
                page:page-1,
                limit
            }
        }

        res.status(200).json({
            success:true,
            count:coWorkingSpaces.length,
            pagination,
            data:coWorkingSpaces
        });
    }catch(err){
        res.status(400).json({success:false});
    }
};

//@desc Get single coWorkingSpace
//route Get /api/v1/coWorkingSpace/:id
//@access Public
exports.getCoWorkingSpace=async(req,res,next)=>{
    try{
        const coWorkingSpace = await CoWorkingSpace.findById(req.params.id);

        if(!coWorkingSpace){
            return res.status(400).json({success:false});
        }

        res.status(200).json({success:true,data:coWorkingSpace});
    }catch(err){
        res.status(400).json({success:false});
    }
};

//@desc Create single coWorkingSpace
//route POST /api/v1/coWorkingSpaces
//@access Private
exports.createCoWorkingSpace=async(req,res,next)=>{
    const coWorkingSpace = await CoWorkingSpace.create(req.body);
    res.status(201).json({
        success:true,
        data:coWorkingSpace
    });
};

//@desc Update single coWorkingSpace
//route PUT /api/v1/coWorkingSpaces/:id
//@access Private
exports.updateCoWorkingSpace=async(req,res,next)=>{
    try{
        const coWorkingSpace = await CoWorkingSpace.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators:true
        });

        if(!coWorkingSpace){
            return res.status(400).json({success:false});
        }

        res.status(200).json({success:true, data: coWorkingSpace});
    }catch(err){
        res.status(400).json({success:false});
    }
};

//@desc Delete single coWorkingSpace
//route DELETE /api/v1/coWorkingSpaces/:id
//@access Private
exports.deleteCoWorkingSpace=async(req,res,next)=>{
    try{
        const coWorkingSpace = await CoWorkingSpace.findByIdAndDelete(req.params.id);

        if(!coWorkingSpace){
            return res.status(400).json({success:false});
        }

        res.status(200).json({success:true, data: {}});
    }catch(err){
        res.status(400).json({success:false});
    }
};