<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Country;
use App\Models\State;
use App\Models\City;

class CitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $india = Country::where('iso_code', 'IN')->first();

        $citiesByState = [
            'Andhra Pradesh' => [
                'Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool',
                'Rajahmundry', 'Kakinada', 'Tirupati', 'Anantapur', 'Kadapa',
                'Ongole', 'Eluru', 'Srikakulam', 'Chittoor', 'Machilipatnam'
            ],

            'Arunachal Pradesh' => [
                'Itanagar', 'Naharlagun', 'Pasighat', 'Tawang', 'Ziro',
                'Bomdila', 'Roing', 'Tezu', 'Along (Aalo)', 'Changlang',
                'Khonsa', 'Namsai', 'Seppa', 'Anini', 'Daporijo'
            ],

            'Assam' => [
                'Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon',
                'Tinsukia', 'Tezpur', 'Sivasagar', 'Karimganj', 'Diphu',
                'North Lakhimpur', 'Goalpara', 'Barpeta'
            ],
            
            'Andaman and Nicobar Islands' => [
                'Port Blair', 'Diglipur', 'Mayabunder', 'Rangat', 'Car Nicobar',
                'Campbell Bay', 'Hut Bay'
            ],

            'Bihar' => [
                'Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga',
                'Arrah', 'Begusarai', 'Katihar', 'Munger', 'Purnia',
                'Saharsa', 'Samastipur', 'Siwan', 'Chhapra', 'Motihari'
            ],

            'Chhattisgarh' => [
                'Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg',
                'Rajnandgaon', 'Jagdalpur', 'Raigarh', 'Ambikapur',
                'Mahasamund', 'Kawardha', 'Dhamtari', 'Kanker'
            ],
            
            'Chandigarh' => [
                'Chandigarh'
            ],
            
            'Dadra and Nagar Haveli and Daman and Diu' => [
                'Silvassa', 'Daman', 'Diu'
            ],

            'Delhi' => [
                'New Delhi', 'Old Delhi', 'Dwarka', 'Rohini', 'Karol Bagh',
                'Saket', 'Connaught Place', 'Lajpat Nagar', 'Mayur Vihar',
                'Pitampura', 'Vasant Kunj'
            ],

            'Goa' => [
                'Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda',
                'Bicholim', 'Curchorem', 'Sanquelim', 'Quepem', 'Canacona'
            ],

            'Gujarat' => [
                'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar',
                'Jamnagar', 'Junagadh', 'Gandhinagar', 'Anand', 'Morbi',
                'Nadiad', 'Navsari', 'Mehsana', 'Bharuch', 'Vapi',
                'Porbandar', 'Godhra', 'Palanpur', 'Valsad', 'Dahod'
            ],

            'Haryana' => [
                'Faridabad', 'Gurgaon', 'Panipat', 'Ambala', 'Yamunanagar',
                'Rohtak', 'Hisar', 'Karnal', 'Sonipat', 'Panchkula',
                'Bhiwani', 'Sirsa', 'Bahadurgarh', 'Jind', 'Kaithal',
                'Kurukshetra', 'Rewari', 'Palwal'
            ],

            'Himachal Pradesh' => [
                'Shimla', 'Manali', 'Dharamshala', 'Solan', 'Mandi',
                'Bilaspur', 'Hamirpur', 'Kullu', 'Chamba', 'Una',
                'Nahan', 'Palampur', 'Kangra', 'Kinnaur', 'Keylong'
            ],

            'Jharkhand' => [
                'Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro Steel City', 'Hazaribagh',
                'Deoghar', 'Giridih', 'Ramgarh', 'Phusro', 'Chakradharpur',
                'Chaibasa', 'Medininagar (Daltonganj)', 'Godda', 'Sahibganj',
                'Jhumri Telaiya', 'Simdega', 'Pakur'
            ],
            
            'Jammu and Kashmir' => [
                'Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Udhampur',
                'Kathua', 'Kupwara', 'Pulwama', 'Kulgam', 'Poonch',
                'Rajouri', 'Doda'
            ],

            'Karnataka' => [
                'Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi', 'Dharwad',
                'Belagavi', 'Kalaburagi (Gulbarga)', 'Ballari', 'Tumakuru',
                'Shivamogga', 'Raichur', 'Bidar', 'Udupi', 'Davangere',
                'Chitradurga', 'Kolar', 'Hassan', 'Mandya', 'Chikkamagaluru',
                'Karwar'
            ],
            
            'Kerala' => [
                'Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Alappuzha',
                'Palakkad', 'Kannur', 'Kottayam', 'Malappuram', 'Kollam',
                'Pathanamthitta', 'Idukki', 'Wayanad', 'Kasargod'
            ],
            
            'Ladakh' => [
                'Leh', 'Kargil', 'Diskit', 'Nubra', 'Zanskar'
            ],

            'Lakshadweep' => [
                'Kavaratti', 'Agatti', 'Amini', 'Andrott', 'Kalpeni',
                'Kadmat', 'Minicoy'
            ],

            'Madhya Pradesh' => [
                'Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain',
                'Sagar', 'Satna', 'Ratlam', 'Rewa', 'Khandwa',
                'Dewas', 'Chhindwara', 'Shivpuri', 'Vidisha', 'Burhanpur',
                'Sehore', 'Betul', 'Mandsaur', 'Neemuch', 'Hoshangabad'
            ],

            'Maharashtra' => [
                'Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Thane',
                'Solapur', 'Kolhapur', 'Amravati', 'Pimpri-Chinchwad', 'Kalyan-Dombivli',
                'Vasai-Virar', 'Navi Mumbai', 'Mira-Bhayandar', 'Bhiwandi-Nizampur',
                'Jalgaon', 'Akola', 'Sangli-Miraj', 'Latur', 'Chandrapur',
                'Dhule', 'Ahmednagar', 'Nanded', 'Satara', 'Ratnagiri',
                'Osmanabad', 'Wardha', 'Yavatmal', 'Gondia', 'Beed',
                'Parbhani', 'Hingoli', 'Sindhudurg', 'Palghar', 'Bhandara', 'Gadchiroli'
            ],    

            'Manipur' => [
                'Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur', 'Ukhrul',
                'Senapati', 'Tamenglong', 'Jiribam', 'Kakching', 'Moreh',
                'Moirang', 'Noney', 'Pherzawl', 'Kamjong', 'Tengnoupal'
            ],

            'Meghalaya' => [
                'Shillong', 'Tura', 'Nongpoh', 'Jowai', 'Baghmara',
                'Williamnagar', 'Resubelpara', 'Mairang', 'Nongstoin',
                'Ampati', 'Khliehriat', 'Mawkyrwat'
            ],

            'Mizoram' => [
                'Aizawl', 'Lunglei', 'Champhai', 'Serchhip', 'Kolasib',
                'Saiha', 'Lawngtlai', 'Mamit', 'Biate', 'North Vanlaiphai',
                'Saitual', 'Hnahthial'
            ],

            'Nagaland' => [
                'Kohima', 'Dimapur', 'Mokokchung', 'Tuensang', 'Wokha',
                'Zunheboto', 'Mon', 'Phek', 'Kiphire', 'Longleng',
                'Chümoukedima'
            ],

            'Odisha' => [
                'Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur',
                'Balasore', 'Baripada', 'Bhadrak', 'Puri', 'Jeypore',
                'Jharsuguda', 'Angul', 'Kendrapara', 'Rayagada', 'Koraput',
                'Bargarh', 'Nabarangpur', 'Kalahandi', 'Dhenkanal', 'Jagatsinghpur'
            ],

            'Punjab' => [
                'Amritsar', 'Ludhiana', 'Jalandhar', 'Patiala', 'Bathinda',
                'Mohali', 'Hoshiarpur', 'Moga', 'Firozpur', 'Phagwara',
                'Kapurthala', 'Pathankot', 'Sangrur', 'Barnala', 'Faridkot',
                'Rupnagar (Ropar)', 'Muktsar', 'Mansa', 'Gurdaspur', 'Nawanshahr'
            ],
            
            'Puducherry' => [
                'Puducherry', 'Karaikal', 'Mahe', 'Yanam'
            ],

            'Rajasthan' => [
                'Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer',
                'Bikaner', 'Alwar', 'Bharatpur', 'Sikar', 'Pali',
                'Tonk', 'Chittorgarh', 'Nagaur', 'Jhunjhunu', 'Barmer',
                'Jaisalmer', 'Bhilwara', 'Dungarpur', 'Sawai Madhopur',
                'Hanumangarh', 'Sri Ganganagar'
            ],

            'Sikkim' => [
                'Gangtok', 'Namchi', 'Gyalshing', 'Mangan',
                'Ravangla', 'Singtam', 'Jorethang', 'Soreng',
                'PakYong', 'Rangpo'
            ],

            'Tamil Nadu' => [
                'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem',
                'Tirunelveli', 'Erode', 'Vellore', 'Thoothukudi', 'Dindigul',
                'Thanjavur', 'Nagercoil', 'Kanchipuram', 'Karur', 'Sivakasi',
                'Cuddalore', 'Nagapattinam', 'Pudukkottai', 'Krishnagiri',
                'Ramanathapuram', 'Dharmapuri'
            ],

            'Telangana' => [
                'Hyderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar',
                'Ramagundam', 'Mahbubnagar', 'Adilabad', 'Suryapet', 'Miryalaguda',
                'Jagtial', 'Mancherial', 'Kothagudem', 'Sangareddy', 'Vikarabad',
                'Nalgonda', 'Wanaparthy', 'Nagarkurnool', 'Medak', 'Zaheerabad'
            ],

            'Tripura' => [
                'Agartala', 'Udaipur', 'Kailashahar', 'Dharmanagar', 'Belonia',
                'Ambassa', 'Khowai', 'Sonamura', 'Teliamura', 'Sabroom',
                'Bishalgarh', 'Jirania', 'Mohanpur'
            ],

            'Uttar Pradesh' => [
                'Lucknow', 'Kanpur', 'Varanasi', 'Agra', 'Allahabad (Prayagraj)',
                'Ghaziabad', 'Noida', 'Meerut', 'Bareilly', 'Aligarh',
                'Moradabad', 'Saharanpur', 'Gorakhpur', 'Faizabad (Ayodhya)',
                'Jhansi', 'Muzaffarnagar', 'Mathura', 'Firozabad', 'Shahjahanpur',
                'Rampur', 'Bulandshahr', 'Sitapur', 'Etawah', 'Raebareli',
                'Ballia', 'Basti', 'Barabanki', 'Hardoi', 'Unnao',
                'Mirzapur', 'Sultanpur', 'Bahraich', 'Lakhimpur Kheri'
            ],

            'Uttarakhand' => [
                'Dehradun', 'Haridwar', 'Rishikesh', 'Roorkee', 'Haldwani',
                'Nainital', 'Almora', 'Pithoragarh', 'Rudrapur', 'Kashipur',
                'Mussoorie', 'Kotdwar', 'Tehri', 'Chamoli', 'Bageshwar',
                'Champawat', 'Uttarkashi'
            ],

            'West Bengal' => [
                'Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri',
                'Darjeeling', 'Kharagpur', 'Haldia', 'Bardhaman', 'Malda',
                'Jalpaiguri', 'Cooch Behar', 'Krishnanagar', 'Serampore',
                'Chandannagar', 'Bankura', 'Purulia', 'Medinipur',
                'Raiganj', 'Balurghat'
            ],
        ];

        foreach ($citiesByState as $stateName => $cities) {

            $state = State::where('country_id', $india->id)
                        ->where('name', $stateName)
                        ->first();

            if (!$state) {
                continue;
            }

            foreach ($cities as $city) {
                City::firstOrCreate(
                    [
                        'country_id' => $india->id,
                        'state_id' => $state->id,
                        'name' => $city,
                        'status' => 1
                    ],
                    [
                        'country_id' => $india->id,
                        'state_id' => $state->id,
                        'name' => $city,
                        'status' => 1
                    ]
                );
            }
        }

    }
}
