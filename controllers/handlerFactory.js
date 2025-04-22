/* eslint-disable prettier/prettier */
/* eslint-disable import/no-useless-path-segments */
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apifeatures');



exports.deleteOne= Model=>
  catchAsync(async(req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if(!doc){
      return next(new AppError('No document find that ID', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

  exports.updateOne = Model=>catchAsync(async(req, res, next) => {
    const doc =await Model.findByIdAndUpdate(req.params.id, req.body,{
      new: true,
      runValidators:true
    });
    if(!doc){
      return next(new AppError('No doc find that ID', 404));
    }
    res.status(200).json({
      status: 'success',
       doc
    });
  });


  exports.createOne = Model=> catchAsync(async(req, res, next) => {
   
    const newModel =   await Model.create(req.body);
  
  res.status(201).json({
    status:'success',
    data:{
      doc: newModel
    }
  });
  });


  exports.getOne =(Model, popOption)=>catchAsync(async (req, res, next) => {
    
    let query = Model.findById(req.params.id);

    if(popOption) query = query.populate(popOption);
    const doc = await query;
    
    // const doc =  await Model.findById(req.params.id).populate('reviews');

  
    if(!doc){
      return next(new AppError('No doc find that ID', 404));
    }
  
    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  
   
  });


exports.getAll = Model =>catchAsync(async (req, res, next) => {

  //to allow nested get review on tour
  let filter ={}
  if(req.params.tourId) filter={tour:req.params.tourId};
    
    // Execute query
    const features = new APIFeatures(Model.find(filter), req.query)
    .filiter()
    .sort()
    .limitFields()
    .paginate();

    const doc = await features.query; 
    // const doc = await features.query.explain(); 

// Send respone
  res.status(200).json({
    status: 'success',
    result: doc.length,
    data: {
      docs: doc,
    },
  });
});




  



 

  


