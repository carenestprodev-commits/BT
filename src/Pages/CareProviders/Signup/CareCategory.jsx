// React import not required with automatic JSX transform
import { useDispatch } from 'react-redux';
import { saveStep } from '../../../Redux/CareProviderAuth';

function CareCategory({ selectedCategory, setSelectedCategory, updateFormData, handleNext, handleBack }) {
  const dispatch = useDispatch();
  const categoryKeyMap = {
    'Childcare': 'childcare',
    'Elderly Care': 'elderlycare',
    'Tutoring': 'tutoring',
    'Housekeeping': 'housekeeping'
  }
  const categories = [
    {
      name: "Childcare",
      desc: "Find the Right child Care Provider",
      img: "/box1.svg",
    },
    {
      name: "Elderly Care",
      desc: "Find Your Perfect Elderly Care Provider",
      img: "/box2.svg",
    },
    {
      name: "Tutoring",
      desc: "Find Expert Tutors For Every Subject Area",
      img: "/box3.svg",
    },
    { name: "Housekeeping", desc: "Find Reliable House Keepers", img: "/box4.svg" },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-100 font-sfpro">
      <div className="flex items-center mb-6">
        <button onClick={handleBack} className="mr-4 text-gray-500 hover:text-gray-700">←</button>
        <div className="flex justify-between items-center w-full">
          <h3 className="text-lg text-gray-700">
            What category of Care are you interested in
          </h3>
          <div className="flex items-center">
            <span className="text-lg text-[#0093d1] font-bold">Step 2</span> <span className="ml-2 text-lg text-gray-500"> of 8</span>
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-8">
        Kindly select options to help us understand your preferences
      </p>

      <div className="grid grid-cols-2 gap-6 mb-8">
        {categories.map((cat) => (
          <div
            key={cat.name}
            onClick={() => {
              setSelectedCategory(cat.name);
              updateFormData('careCategory', cat.name);
              const key = categoryKeyMap[cat.name] || cat.name.toLowerCase();
              dispatch(saveStep({ stepName: 'careCategory', data: key }))
            }}
            className={`border rounded-2xl cursor-pointer transition shadow-sm hover:shadow-md flex flex-col items-center justify-center text-center aspect-square ${
              selectedCategory === cat.name
                ? "border-[#00b3a4] bg-[#f0fbf9]"
                : "border-gray-200"
            }`}
          >
            <img src={cat.img} alt={cat.name} className="h-30 mb-4" />
            <h4 className="text-lg font-medium text-gray-800">
              {cat.name}
            </h4>
            <p className="text-sm text-gray-500 mt-2 max-w-[80%]">
              {cat.desc}
            </p>
          </div>
        ))}
      </div>

      <button 
        onClick={() => {
          // ensure saved
          const key = categoryKeyMap[selectedCategory] || (selectedCategory && selectedCategory.toLowerCase())
          if (key) dispatch(saveStep({ stepName: 'careCategory', data: key }))
          handleNext()
        }}
        disabled={!selectedCategory}
        className={`w-full text-lg font-medium py-3 rounded-md transition ${
          selectedCategory
            ? 'bg-[#0093d1] text-white hover:bg-[#007bb0]'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        Next
      </button>
    </div>
  );
}

export default CareCategory;
