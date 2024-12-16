import asyncio
import json
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from playwright.async_api import async_playwright
from pydantic import BaseModel
from typing import List, Dict, Optional

class SearchConfig:
    """Configuration for shopping site search parameters"""
    def __init__(self):
        self.sites = {
            'Myntra': 'https://www.myntra.com/search?q={}',
            'Amazon': 'https://www.amazon.in/s?k={}',
            'Westside': 'https://www.westside.com/search?q={}',
            'Zara': 'https://www.zara.com/in/en/search?searchTerm={}',
            'Mango': 'https://shop.mango.com/in/search?q={}'
        }
        self.max_results_per_site = 5
        self.timeout = 30  # seconds
        self.headless = True

class ProductResult(BaseModel):
    """Structured product search result"""
    site: str
    title: str
    price: str
    url: str
    image_url: Optional[str] = None

class ShoppingAssistant:
    def __init__(self, config: SearchConfig = SearchConfig()):
        self.config = config

    async def search_site(self, page, site_name: str, site_url: str, query: str, filters: Dict = None):
        """Perform search on a specific shopping site with optional filtering"""
        try:
            # Construct search URL with potential filtering
            full_url = site_url.format(query)
            if filters:
                for key, value in filters.items():
                    # Add filtering logic based on site-specific parameters
                    full_url += f"&{key}={value}"
            
            await page.goto(full_url, timeout=self.config.timeout * 1000)
            
            # Site-specific search result selectors (advanced placeholder logic)
            selectors = {
                'Myntra': {
                    'product': '.product-base',
                    'title': '.product-title',
                    'price': '.product-price',
                    'image': '.product-imageSliderContainer img'
                },
                'Amazon': {
                    'product': '.s-result-item',
                    'title': 'h2 a span',
                    'price': '.a-price-whole',
                    'image': '.s-image'
                },
                'Westside': {
                    'product': '.product-item',
                    'title': '.product-name',
                    'price': '.product-price',
                    'image': '.product-image img'
                }
            }
            
            site_selector = selectors.get(site_name, {})
            
            # Wait for results to load
            await page.wait_for_selector(site_selector.get('product', 'body'), 
                                         timeout=self.config.timeout * 1000)
            
            # Extract products
            products = await page.query_selector_all(site_selector.get('product', 'body'))
            
            site_results = []
            for product in products[:self.config.max_results_per_site]:
                try:
                    # Extract product details with fallback mechanisms
                    title_elem = await product.query_selector(site_selector.get('title', 'body'))
                    price_elem = await product.query_selector(site_selector.get('price', 'body'))
                    image_elem = await product.query_selector(site_selector.get('image', 'body'))
                    
                    title = await title_elem.text_content() if title_elem else 'N/A'
                    price = await price_elem.text_content() if price_elem else 'N/A'
                    image_url = await image_elem.get_attribute('src') if image_elem else None
                    
                    product_result = ProductResult(
                        site=site_name,
                        title=title,
                        price=price,
                        url=page.url,
                        image_url=image_url
                    )
                    site_results.append(product_result)
                except Exception as e:
                    print(f"Error extracting product from {site_name}: {e}")
            
            return site_results
        
        except Exception as e:
            print(f"Search failed for {site_name}: {e}")
            return []

    async def search(self, query: str, filters: Dict = None):
        """Conduct parallel searches across multiple shopping sites"""
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=self.config.headless)
            
            # Create tasks for parallel site searches
            search_tasks = []
            for site_name, site_url in self.config.sites.items():
                context = await browser.new_context()
                page = await context.new_page()
                task = asyncio.create_task(
                    self.search_site(page, site_name, site_url, query, filters)
                )
                search_tasks.append(task)
            
            # Collect results
            site_results = await asyncio.gather(*search_tasks)
            
            # Flatten results
            results = [result for sublist in site_results for result in sublist]
            
            await browser.close()
            return results

# FastAPI Backend
app = FastAPI()

# Add CORS middleware to allow frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.websocket("/ws/search")
async def websocket_search_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time shopping searches"""
    await websocket.accept()
    
    assistant = ShoppingAssistant()
    
    try:
        while True:
            # Receive search data
            data = await websocket.receive_json()
            query = data.get('query', '')
            filters = data.get('filters', {})
            
            try:
                # Perform search
                results = await assistant.search(query, filters)
                
                # Send results back to client
                await websocket.send_json({
                    "status": "success",
                    "results": [result.dict() for result in results]
                })
            
            except Exception as e:
                # Send error response
                await websocket.send_json({
                    "status": "error",
                    "message": str(e)
                })
    
    except Exception as e:
        print(f"WebSocket error: {e}")
        await websocket.close()

# Run the server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)